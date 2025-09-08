import { useRef } from 'react';
import { usePipelineApi } from './usePipelineApi';
import { useAppDispatch } from '@/hooks/useRedux';
import { addMessage } from '@/store/slices/chat/chatSlice';
import { setRenderer, updateData, setStatus } from '@/store/slices/chat/renderSlice';
import { setTwoColumn } from '@/store/slices/chat/layoutSlice';

interface Answers {
  engine?: string;
  type?: 'design' | 'requirement';
  projectId?: number;
  name?: string;
}

export function usePipelineWizard() {
  const api = usePipelineApi();
  const dispatch = useAppDispatch();

  const state = useRef<{ step: number; answers: Answers; active: boolean; pipelineId?: string }>({
    step: 0,
    answers: {},
    active: false,
  });

  const ask = (content: string) => {
    dispatch(addMessage({ role: 'assistant', content }));
  };

  const progress = async () => {
    const a = state.current.answers;
    if (!a.engine) return ask('Which engine do you want for your pipeline? (pyspark / pyflink)');
    if (!a.type) return ask('Is this a Design or Requirement pipeline?');
    if (!a.projectId) {
      const projects = await api.listProjects();
      ask(`Choose a project for this pipeline: ${projects.map((p) => p.name).join(', ')}`);
      return;
    }
    if (!a.name) return ask('Give your pipeline a name.');

    // ready -> create pipeline
    const res = await api.createPipeline({
      name: a.name,
      projectId: a.projectId,
      type: a.type!,
      engine: a.engine as any,
    });
    const id = String(res.pipeline_id ?? res.id);
    state.current.pipelineId = id;

    dispatch(setTwoColumn());
    dispatch(setRenderer('pipeline-renderer'));
    dispatch(setStatus('ready'));
    dispatch(updateData({ pipelineId: id, pipelineJson: {}, mode: 'create-pipeline' }));
    dispatch(addMessage({ role: 'assistant', content: 'Pipeline canvas opened. You can start designing.' }));
    state.current.active = false; // done
  };

  const start = () => {
    state.current = { step: 0, answers: {}, active: true };
    ask('Let’s set up your pipeline.');
    progress();
  };
  const submit = async (text: string) => {
    if (!state.current.active) return;
    const a = state.current.answers;
    const lower = text.toLowerCase();
    if (!a.engine) {
      a.engine = lower;
    } else if (!a.type) {
      a.type = lower.includes('requirement') ? 'requirement' : 'design';
    } else if (!a.projectId) {
      const id = await api.resolveProjectIdByName(text);
      if (id) a.projectId = id;
    } else if (!a.name) {
      a.name = text;
    }
    progress();
  };
  const reset = () => (state.current.active = false);
  const isActive = () => state.current.active;
  return { start, submit, reset, isActive };
}
