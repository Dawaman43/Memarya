import Image from "next/image";
import Link from "next/link";

function Header() {
  return (
    <div>
      <Link href="/">
        <Image src="/logo.png" alt="Logo" width={150} height={150} />
      </Link>
    </div>
  );
}

export default Header;
