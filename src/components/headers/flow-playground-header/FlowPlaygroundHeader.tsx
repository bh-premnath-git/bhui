import {
  Inputsection,
  PlaybackButton,
  AIButton,
  SettingsModal,
  EnvironmentSelect,
  SchedulePicker,
  CommitPart,
  DeployingPart,
  AutoSaveButton
} from './index';

function FlowPlaygroundHeader() {
  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-2">
          <AutoSaveButton />
          <Inputsection />
          <SettingsModal />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <EnvironmentSelect />
            <SchedulePicker />
          </div>
          <div className="flex items-center gap-4">
            <DeployingPart />
            <CommitPart />
            <PlaybackButton />
          </div>
          <div className="border-l border-border pl-6">
            <AIButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowPlaygroundHeader;
