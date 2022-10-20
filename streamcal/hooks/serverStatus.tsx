import { useEffect, useState } from "react";

interface IServerStatus {
  Status?: any;
  Version?: any;
  Download_URL?: any;
}

function serverStatus() {
  const [getServerStatus, setServerStatus] = useState<IServerStatus>({
    Status: "",
    Version: "",
    Download_URL: "",
  });

  useEffect(() => {
    async function loadServer() {
      try {
        const req = await fetch("https://pastebin.com/raw/Guayn0nR");
        const data: IServerStatus = await req.json();
        if (data.Status) {
          setServerStatus(data);
        }
      } catch (e: any) {
        console.log("serverStatus Error", e.message);
      }
    }

    loadServer();
  }, []);

  return getServerStatus;
}

enum eServer {
  Offline,
  Online,
}

export default serverStatus;
export { IServerStatus, eServer };
