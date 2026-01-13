"use client";

import Image from "next/image";
import Link from "next/link";
import darkLogo from "@/store/images/materialm-dark-logo.svg";
import lightLogo from "@/store/images/materialm-light-logo.svg";

const FullLogo = (width: number = 152, height: number = 36) => {
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
