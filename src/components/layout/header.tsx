import Image from "next/image";

function Header() {
  return (
    <div>
      <Image src="/logo.png" alt="Logo" width={100} height={100} />
    </div>
  );
}

export default Header;
