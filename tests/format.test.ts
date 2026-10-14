import { describe, expect, it } from "vitest";
import {
  addDays,
  bmi,
  bmiLabel,
  dayShort,
  glucoseStatus,
  lastNDays,
  naira,
  pct,
  prettyDate,
  prettyTime,
  startOfWeek,
  weekDays,
} from "@/lib/format";

describe("date helpers", () => {
  it("adds days across month boundaries without drifting", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2026-10-14", 7)).toBe("2026-10-21");
  });

  it("starts weeks on Monday", () => {
    // 2026-10-14 is a Wednesday
    expect(dayShort(startOfWeek("2026-10-14"))).toBe("Mon");
    expect(startOfWeek("2026-10-14")).toBe("2026-10-12");
    // Sunday belongs to the week that started the previous Monday
    expect(startOfWeek("2026-10-18")).toBe("2026-10-12");
  });

  it("returns a seven day week and trailing ranges", () => {
    const week = weekDays("2026-10-14");
    expect(week).toHaveLength(7);
    expect(week[0]).toBe("2026-10-12");
    expect(week[6]).toBe("2026-10-18");
    const last = lastNDays("2026-10-14", 7);
    expect(last).toHaveLength(7);
    expect(last[6]).toBe("2026-10-14");
    expect(last[0]).toBe("2026-10-08");
  });

  it("formats dates and times for the UI", () => {
    expect(prettyDate("2026-10-14")).toBe("Wed, 14 Oct");
    expect(prettyTime("09:00")).toBe("9:00am");
    expect(prettyTime("13:30")).toBe("1:30pm");
    expect(prettyTime("00:15")).toBe("12:15am");
  });
});

describe("clinical helpers", () => {
  it("classifies glucose readings against the target band", () => {
    expect(glucoseStatus(3.5).tone).toBe("bad");
    expect(glucoseStatus(6.4).tone).toBe("good");
    expect(glucoseStatus(7.8).tone).toBe("good");
    expect(glucoseStatus(9.1).tone).toBe("warn");
    expect(glucoseStatus(11.2).tone).toBe("bad");
  });

  it("computes BMI and its band", () => {
    expect(bmi(82, 168)!).toBeCloseTo(29.05, 1);
    expect(bmi(null, 168)).toBeNull();
    expect(bmiLabel(17)).toBe("Underweight");
    expect(bmiLabel(22)).toBe("Healthy");
    expect(bmiLabel(29)).toBe("Overweight");
    expect(bmiLabel(31)).toBe("Obese");
  });

  it("formats naira and percentages", () => {
    expect(naira(18000)).toBe("₦18,000");
    expect(naira(100000)).toBe("₦100,000");
    expect(pct(6310, 8000)).toBe(79);
    expect(pct(12000, 8000)).toBe(100);
    expect(pct(0, 0)).toBe(0);
  });
});
