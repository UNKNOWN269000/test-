import logo from "./logo.png";

export default function Logo() {
  return (
    <img
      src={logo}
      alt="Ultra Aluminum Logo"
      className="h-full w-full object-cover"
    />
  );
}
