import React from 'react';
import SearchDemo from './SearchDemo';
import TabDemo from './TabDemo';
import PendingBadgeDemo from './PendingBadgeDemo';
import PendingSkeletonDemo from './PendingSkeletonDemo';
import DeferredDemo from './DeferredDemo';
import PitfallSyncReadDemo from './PitfallSyncReadDemo';
import PrincipleVisualDemo from './PrincipleVisualDemo';
import TimeSlicingDemo from './TimeSlicingDemo';
import RouteTransitionDemo from './RouteTransitionDemo';

export type LiveDemoType =
  | 'search'
  | 'tab'
  | 'pending-badge'
  | 'pending-skeleton'
  | 'route-transition'
  | 'deferred'
  | 'pitfall-sync-read'
  | 'principle-visual'
  | 'time-slicing';

interface LiveDemoProps {
  type: LiveDemoType;
}

const LiveDemo: React.FC<LiveDemoProps> = ({ type }) => {
  switch (type) {
    case 'search':
      return <SearchDemo />;
    case 'tab':
      return <TabDemo />;
    case 'pending-badge':
      return <PendingBadgeDemo />;
    case 'pending-skeleton':
      return <PendingSkeletonDemo />;
    case 'route-transition':
      return <RouteTransitionDemo />;
    case 'deferred':
      return <DeferredDemo />;
    case 'pitfall-sync-read':
      return <PitfallSyncReadDemo />;
    case 'principle-visual':
      return <PrincipleVisualDemo />;
    case 'time-slicing':
      return <TimeSlicingDemo />;
    default:
      return null;
  }
};

export default LiveDemo;
