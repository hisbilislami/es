import { redirect, type MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "E-Sign" },
    { name: "description", content: "Trustmedis Sign" },
  ];
};

export const loader = () => {
  throw redirect("/auth");
};

export default function Index() {
  return <Link to="/auth">Ke Halaman Login</Link>;
}
