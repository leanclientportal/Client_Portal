'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, XIcon } from 'lucide-react';
import { toast, useToast } from '@/hooks/use-toast';
import { getPlans } from '@/lib/api'; // Import plansApi and Plan from the centralized api index
import { CommonApiResponse, GetPlansResponse, Plan } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

const UpgradePlanPage = () => {
  const { toast } = useToast();
  const { activeProfile, activeProfileId, token } = useAuth();
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response: CommonApiResponse<GetPlansResponse> = await getPlans(token);
      if (response.success && response.data) {
        setPlans(response.data.plans);
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch plans.", variant: "destructive" });
        setPlans(null);
        setError(response.message || "Failed to fetch plans.");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch plans.", variant: "destructive" });
      setPlans(null);
      setError(error.message || "Failed to fetch plans.");
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleUpgradeRequest = async (requestedPlanId: string) => {
    console.log(`Requesting upgrade to plan: ${requestedPlanId} with billing cycle: ${selectedBillingCycle}`);

    // This is a placeholder for your actual API call to upgrade the plan
    // In a real application, you would use plansApi.requestPlanUpgrade here
    try {
      const response = await new Promise<{ success: boolean; message?: string }>((resolve) => {
        setTimeout(() => {
          if (requestedPlanId !== 'free') {
            resolve({ success: true, message: `Successfully requested upgrade to ${requestedPlanId.toUpperCase()} plan!` });
          } else {
            resolve({ success: false, message: 'Cannot upgrade to Free plan.' });
          }
        }, 1500);
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || `Failed to submit upgrade request for ${requestedPlanId}.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting plan upgrade request:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Extract all unique feature names to create the left-hand column
  const allFeatures: { name: string; id: string }[] = [];
  if (plans && plans.length > 0) {
    const featureNames = new Set<string>();
    plans.forEach(plan => {
      plan.features.forEach(feature => {
        if (!featureNames.has(feature.name)) {
          featureNames.add(feature.name);
          allFeatures.push({ name: feature.name, id: feature.name.replace(/\s+/g, '-').toLowerCase() });
        }
      });
    });
  }

  if (loading) {
    return <div className="text-center py-8">Loading plans...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (plans && plans.length === 0) {
    return <div className="text-center py-8">No plans available.</div>;
  }

  return (
    <div className="bg-background relative w-full break-words py-3 px-3 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm sm:shadow-md dark:shadow-none dark:sm:shadow-dark-md">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Choose Your Plan</h1>

        <div className="flex justify-center mb-8">
          <Button
            onClick={() => setSelectedBillingCycle('monthly')}
            variant={selectedBillingCycle === 'monthly' ? 'default' : 'outline'}
            className="rounded-r-none"
          >
            Monthly
          </Button>
          <Button
            onClick={() => setSelectedBillingCycle('annual')}
            variant={selectedBillingCycle === 'annual' ? 'default' : 'outline'}
            className="rounded-l-none"
          >
            Annual (20% off)
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"></th>
                {plans && plans.map((plan) => (
                  <th key={plan._id} className="py-4 px-6 text-center text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {/* Monthly/Annual Price Row */}
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedBillingCycle === 'monthly' ? 'Monthly Price' : 'Annual Price'}
                </td>
                {plans && plans.map((plan) => (
                  <td key={`${plan._id}-price`} className="py-4 px-6 text-center">
                    <span className="text-lg font-extrabold">
                      {selectedBillingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice.split(' ')[0]}
                    </span>
                    {selectedBillingCycle === 'annual' && plan.annualSavings !== '-' && (
                      <span className="block text-green-600 text-xs font-semibold mt-1">{plan.annualSavings}</span>
                    )}
                  </td>
                ))}
              </tr>
              {/* Features Rows */}
              {allFeatures.map((featureItem) => (
                <tr key={featureItem.id}>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {featureItem.name}
                  </td>
                  {plans && plans.map((plan) => {
                    const planFeature = plan.features.find(f => f.name === featureItem.name);
                    return (
                      <td key={`${plan._id}-${featureItem.id}`} className="py-4 px-6 text-center text-sm text-gray-700 dark:text-gray-300 whitespace-break-spaces">
                        {planFeature ? (
                          planFeature.detail ? (
                            planFeature.detail
                          ) : (
                            planFeature.available ? (
                              <CheckIcon className="text-green-500 mx-auto" size={18} />
                            ) : (
                              <XIcon className="text-red-500 mx-auto" size={18} />
                            )
                          )
                        ) : (
                          <XIcon className="text-red-500 mx-auto" size={18} /> // Indicate if feature is not explicitly listed for a plan
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <td className="py-4 px-6"></td>
                {plans && plans.map((plan) => (
                  <td key={`footer-${plan._id}`} className="py-4 px-6 text-center">
                    <Button onClick={() => handleUpgradeRequest(plan._id)} className="w-full" disabled={plan._id === 'free'}>
                      {plan._id === 'free' ? 'Current Plan' : 'Get Started'}
                    </Button>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlanPage;