import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'
import { PageContainer, PageMain } from '@/components/layout/PageContainer'
import { AiAssistantFab } from '@/components/layout/AiAssistantFab'

export function AppShell() {
  return (
    <PageContainer>
      <AppHeader />
      <PageMain>
        <Outlet />
      </PageMain>
      <AiAssistantFab />
    </PageContainer>
  )
}
