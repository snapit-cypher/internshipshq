import { SystemContext } from "@/components/providers/system-provider";
import { useContext } from "react";

export const useSystem = () => useContext(SystemContext);
