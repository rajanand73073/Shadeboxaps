import multiavatar from "@multiavatar/multiavatar/esm";

const multivatar = (seed: string): string => {
  const svgCode = multiavatar(seed);

  return svgCode;
};

export default multivatar;
