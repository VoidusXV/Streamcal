import { useEffect, useState } from "react";
export default function serverStatus() {
  const [getServerStatus, setServerStatus] = useState<any>("0");

  useEffect(() => {
    async function loadServer() {
      try {
        const req = await fetch("https://pastebin.com/raw/Guayn0nR");
        const data = await req.text();
        setServerStatus(data);
      } catch (e) {
        setServerStatus("0");
      }
    }

    loadServer();
  }, []);

  return getServerStatus;
}
