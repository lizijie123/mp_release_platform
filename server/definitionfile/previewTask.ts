// 预览任务进度对象
export interface PreviewJournal {
  message?: string
  time?: string
  interval?: string
}

// 预览任务对象
export interface PreviewTask {
  id: string
  journal?: Array<PreviewJournal>
  errorMessage?: string
  base64?: string
  status: string
}
