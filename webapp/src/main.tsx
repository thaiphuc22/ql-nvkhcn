import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App as AntApp } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './branding/tokens.css'
import { theme } from './theme'
import { ProcessProvider } from './store/ProcessContext'
import { NhiemVuProvider } from './store/NhiemVuContext'
import { DossierProvider } from './store/DossierContext'
import { FormProvider } from './store/FormContext'
import { BreadcrumbProvider } from './store/BreadcrumbContext'
import { AuthProvider } from './store/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={viVN} theme={theme}>
      <AntApp>
        <AuthProvider>
        <ProcessProvider>
          <FormProvider>
            <NhiemVuProvider>
              <DossierProvider>
                <BrowserRouter>
                  <BreadcrumbProvider>
                    <App />
                  </BreadcrumbProvider>
                </BrowserRouter>
              </DossierProvider>
            </NhiemVuProvider>
          </FormProvider>
        </ProcessProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
)
