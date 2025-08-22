import time
from datetime import datetime, timedelta
from typing import List, Tuple, Optional

from MNetUtils.ts_query.query import query_native, query_range_native


class BurnerStatusQuery:
    def __init__(
        self,
        vm_url: str,
        comb_id: str,
        opc_address: str,
        target_status: float = 64.0,
    ) -> None:
        self.vm_url = vm_url
        self.comb_id = comb_id
        self.opc_address = opc_address
        self.target_status = float(target_status)

        query_template = '{comb_id_match,opc_address=~"ns=2;s={opc}"}'
        comb_id_match = f'comb_id="{self.comb_id}"'
        self.query = query_template.format(comb_id_match=comb_id_match, opc=self.opc_address)

    @staticmethod
    def _infer_step_from_points(timestamps: List[float]) -> Optional[float]:
        if len(timestamps) < 3:
            return None
        diffs = [timestamps[i] - timestamps[i - 1] for i in range(1, len(timestamps))]
        diffs = [d for d in diffs if d > 0]
        if not diffs:
            return None
        diffs.sort()
        mid = len(diffs) // 2
        if len(diffs) % 2 == 1:
            return diffs[mid]
        return 0.5 * (diffs[mid - 1] + diffs[mid])

    def _fetch_points(
        self,
        window_seconds: int,
        step_seconds: int,
    ) -> List[Tuple[float, float]]:
        end_ts = int(time.time())
        start_ts = end_ts - int(window_seconds)
        data = query_range_native(self.vm_url, self.query, start_ts, end_ts, step=step_seconds)
        points: List[Tuple[float, float]] = []
        if not data or "data" not in data or "result" not in data["data"]:
            return points
        for result in data["data"]["result"]:
            for ts, val in result.get("values", []):
                try:
                    points.append((float(ts), float(val)))
                except Exception:
                    continue
        points.sort(key=lambda x: x[0])
        return points

    def _build_periods(
        self,
        points: List[Tuple[float, float]],
        step_seconds: int,
        gap_factor: float,
    ) -> List[Tuple[float, float]]:
        if not points:
            return []
        inferred_step = self._infer_step_from_points([p[0] for p in points]) or float(step_seconds)
        max_gap = inferred_step * float(gap_factor)

        periods: List[Tuple[float, float]] = []
        current_start: Optional[float] = None
        current_end: Optional[float] = None
        last_ts: Optional[float] = None

        for ts, status in points:
            if status == self.target_status:
                if current_start is None:
                    current_start = ts
                    current_end = ts
                else:
                    if last_ts is not None and (ts - last_ts) <= max_gap:
                        current_end = ts
                    else:
                        periods.append((current_start, current_end))
                        current_start = ts
                        current_end = ts
            else:
                if current_start is not None:
                    periods.append((current_start, current_end))
                    current_start = None
                    current_end = None
            last_ts = ts

        if current_start is not None and current_end is not None:
            periods.append((current_start, current_end))

        # make end exclusive by adding one step for duration semantics
        periods_exclusive: List[Tuple[float, float]] = []
        for s, e in periods:
            periods_exclusive.append((s, e + inferred_step))
        return periods_exclusive

    def get_current_target_status_period(
        self,
        window_seconds: int = 24 * 3600,
        step_seconds: int = 2,
        gap_factor: float = 2.0,
        min_duration_seconds: int = 0,
    ) -> List[float]:
        """
        查询当前烧嘴是否处于 target_status 状态，并返回其起始/截止时间戳区间 [start_ts, end_ts]。
        若当前不处于该状态则返回空列表。
        end_ts 采用排他上界（最后一个样本时间 + 推断步长）。
        """
        points = self._fetch_points(window_seconds=window_seconds, step_seconds=step_seconds)
        if not points:
            return []

        periods = self._build_periods(points, step_seconds=step_seconds, gap_factor=gap_factor)
        if not periods:
            return []

        # 获取当前瞬时状态
        data = query_native(self.vm_url, self.query)
        current_status = None
        current_ts = None
        if data and "data" in data and "result" in data["data"] and data["data"]["result"]:
            result = data["data"]["result"][0]
            if "value" in result:
                try:
                    current_ts, current_val = result["value"]
                    current_status = float(current_val)
                    current_ts = float(current_ts)
                except Exception:
                    current_status = None
                    current_ts = None

        # 如果当前不在目标状态，直接返回最近一个已经结束的目标区间是否包含当前瞬时（一般不会）
        if current_status != self.target_status:
            # 仅返回最新结束的一个区间（如果要全部，可改为 periods）
            latest = max(periods, key=lambda pe: pe[1])
            return [latest[0], latest[1]] if latest else []

        # 当前在目标状态：找到包含当前时刻 (以区间 [start, end) 判断)
        # 如果实时点落在某个区间尾部之后（由于时序延迟），返回最近一个区间
        for s, e in reversed(sorted(periods, key=lambda pe: pe[0])):
            if s <= current_ts < e:
                # 如果当前仍在持续，返回 [s, current_ts] 的上界也可以返回 e（排他上界）
                return [s, e]
        # 没找到覆盖当前时刻，则返回最新一个
        latest = max(periods, key=lambda pe: pe[1])
        return [latest[0], latest[1]] if latest else []