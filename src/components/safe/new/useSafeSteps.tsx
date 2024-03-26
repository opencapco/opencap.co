import { type stepsType } from "@/components/shared/multistep-modal";
import {
  GeneralDetails,
  GeneralDetailsFields,
  InvestorDetails,
  InvestorDetailsFields,
  Documents,
  DocumentsFields,
} from "./steps";

type SafeStepsType = {
  companyId: string;
};

const useSafeSteps = ({ companyId: string }: SafeStepsType) => {
  const steps: Array<stepsType> = [
    {
      id: 1,
      title: "General details",
      component: GeneralDetails,
      fields: GeneralDetailsFields,
    },
    {
      id: 2,
      title: "Investment details",
      component: InvestorDetails,
      fields: InvestorDetailsFields,
    },
    {
      id: 3,
      title: "Sign & send documents",
      component: Documents,
      fields: DocumentsFields,
    },
  ];

  return steps;
};

export default useSafeSteps;
