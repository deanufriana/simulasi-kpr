export const yearToMonth = ({
  periode,
  per,
}: {
  periode: number;
  per: string;
}): number => {
  if (per === "year") {
    return periode * 12;
  } else {
    return periode;
  }
};

export const monthToYear = ({
  periode,
  per,
}: {
  periode: number;
  per: string;
}): number => {
  if (per === "month") {
    const year = Math.ceil(periode / 12);
    return year;
  } else {
    return periode;
  }
};

export const percentToDecimal = (percent: number): number => {
  return percent / 100;
};
