import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi, projectsApi, type TaskFilters, type ProjectFilters } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { Project, Task } from '@/types';

export function useTasks(filters: TaskFilters) {
  return useQuery({ queryKey: qk.tasks(filters), queryFn: () => tasksApi.list(filters) });
}
export function useTask(id: string) {
  return useQuery({ queryKey: qk.task(id), queryFn: () => tasksApi.get(id), enabled: !!id });
}
export function useProjects(filters: ProjectFilters) {
  return useQuery({ queryKey: qk.projects(filters), queryFn: () => projectsApi.list(filters) });
}
export function useProject(id: string) {
  return useQuery({ queryKey: qk.project(id), queryFn: () => projectsApi.get(id), enabled: !!id });
}
export function useProjectsList() {
  return useQuery({ queryKey: qk.projects('all'), queryFn: () => projectsApi.list({ pageSize: 1000 }) });
}
export function useProjectMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['projects'] });
  const create = useMutation({ mutationFn: (d: Partial<Project>) => projectsApi.create(d), onSuccess: invalidate });
  const update = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => projectsApi.update(id, data), onSuccess: invalidate });
  return { create, update };
}
export function useTaskMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] });
  const create = useMutation({ mutationFn: (d: Partial<Task>) => tasksApi.create(d), onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => tasksApi.update(id, data),
    onSuccess: (_d, v) => { invalidate(); qc.invalidateQueries({ queryKey: qk.task(v.id) }); },
  });
  return { create, update };
}
