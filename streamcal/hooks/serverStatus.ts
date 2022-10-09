
import { useEffect, useState } from 'react';

export default function serverStatus() {
    const [getServerStatus, setServerStatus] = useState<any>("0");

    useEffect(() => {
      async function loadServer() {
        try 
        {
            const status  = await fetch("https://pastebin.com/raw/qTbNPQ6b");
            //console.log("status:",await status.json())
            setServerStatus(await status.json());
        }  
        catch (e) {
            setServerStatus("0")
        }    
      }
  
      loadServer();
    }, []);
  
    return getServerStatus;
  }
  