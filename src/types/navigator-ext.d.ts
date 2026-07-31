interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  addEventListener?: (type: string, listener: EventListener) => void;
}

interface Navigator {
  connection?: NetworkInformation;
  deviceMemory?: number;
}
