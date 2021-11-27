import { Button } from "@mui/material";
import Link from "next/link";
import Navbar from "../../components/Navbar";
export async function getServerSideProps() {
    // Pass data to the page via props
    const data = Math.floor(Math.random() * 100);
    return { props: { data } };
}

export default function ServerControl({ data }: { data: number }) {
    return <p>Your random number is {data}</p>;
}

ServerControl.NavbarOverride = (
    <Navbar>
        <Button color="inherit">
            <Link href="/server-control/login">Login</Link>
        </Button>
    </Navbar>
);
