"use client";

import Image from "next/image";
import Link from "next/link";
import lightLogo from "@/store/images/UdyamiHub_Light_logo.svg";
import darkLogo from "@/store/images/UdyamiHub_Dark_logo.svg";

type FullLogoProps = {
  width: number;
  height: number;
};

const FullLogo = ({ width, height }: FullLogoProps) => {
  return (
    <Link href={"/"}>
      {/* Dark Logo */}
      <Image
        src={darkLogo}
        alt="logo"
        width={width}
        height={height}
        className="block dark:hidden rtl:scale-x-[-1]"
      />
      {/* Light Logo */}
      <Image
        src={lightLogo}
        alt="logo"
        width={width}
        height={height}
        className="hidden dark:block rtl:scale-x-[-1]"
      />
    </Link>
  );
};

export default FullLogo;
