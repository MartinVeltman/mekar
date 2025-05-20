
import React from 'react';

export const WelcomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="9" r="1" fill="currentColor" />
    <circle cx="15" cy="9" r="1" fill="currentColor" />
  </svg>
);

export const CreateReportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
    <path d="M12 8v8M8 12h8" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const InteractiveMapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M9 18l-6-2V5l6 2M9 18l6-2M9 18V7M15 16l6-2V3l-6 2M15 16V5M15 5L9 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="11" r="1" fill="currentColor" />
    <circle cx="15" cy="9" r="1" fill="currentColor" />
  </svg>
);

export const RewardsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="12" cy="8" r="6" strokeWidth="1.5" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" strokeWidth="1.5" />
  </svg>
);

// Icon selector function
interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
}

export const TutorialIcon: React.FC<IconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'welcome':
      return <WelcomeIcon {...props} />;
    case 'create_report':
      return <CreateReportIcon {...props} />;
    case 'interactive_map':
      return <InteractiveMapIcon {...props} />;
    case 'rewards':
      return <RewardsIcon {...props} />;
    default:
      return <WelcomeIcon {...props} />;
  }
};
