import { useState, useEffect } from "react";
import { useAccount } from "../contexts/AccountContext";

export interface AccountStatus {
  id: string;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: string[];
  metadata?: Record<string, string>;
}

export const useAccountStatus = () => {
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const { accountId, setAccountId } = useAccount();

  const fetchAccountStatus = async () => {
    if (!accountId) {
      return;
    }

    try {
      const response = await fetch(`/api/account-status/${accountId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch account status");
      }
      const data = await response.json();
      setAccountStatus(data);
    } catch (error) {
      console.error("Error fetching account status:", error);
      // Don't auto-clear accountId on first error, maybe it's just a network issue
      // but if it's 404, we might want to
    }
  };

  useEffect(() => {
    if (!accountId) return;
    
    setLoading(true);
    fetchAccountStatus().finally(() => setLoading(false));

    const intervalId = setInterval(fetchAccountStatus, 10000); // 10 seconds is usually enough

    return () => clearInterval(intervalId);
  }, [accountId]);

  return {
    accountStatus,
    loading,
    refreshStatus: fetchAccountStatus,
    needsOnboarding:
      !accountStatus?.chargesEnabled || !accountStatus?.detailsSubmitted,
  };
};
