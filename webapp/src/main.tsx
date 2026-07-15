import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App as AntApp } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './branding/tokens.css'
import { theme } from './theme'
import { ProcessProvider } from './store/ProcessContext'
import { NhiemVuProvider } from './store/NhiemVuContext'
import { DossierProvider } from './store/DossierContext'
import { ExceptionProvider } from './store/ExceptionContext'
import { RuleProvider } from './store/RuleContext'
import { RbacProvider } from './store/RbacContext'
import { ApprovalMatrixProvider } from './store/ApprovalMatrixContext'
import { ApprovalSlotCatalogProvider } from './store/ApprovalSlotCatalogContext'
import { IntegrationMappingProvider } from './store/IntegrationMappingContext'
import { ServiceTaskProvider } from './store/ServiceTaskContext'
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
                <ExceptionProvider>
                  <RuleProvider>
                    <RbacProvider>
                      <ApprovalSlotCatalogProvider>
                        <ApprovalMatrixProvider>
                          <IntegrationMappingProvider>
                            <ServiceTaskProvider>
                              <HashRouter>
                              <BreadcrumbProvider>
                                <App />
                              </BreadcrumbProvider>
                            </HashRouter>
                            </ServiceTaskProvider>
                          </IntegrationMappingProvider>
                        </ApprovalMatrixProvider>
                      </ApprovalSlotCatalogProvider>
                    </RbacProvider>
                  </RuleProvider>
                </ExceptionProvider>
              </DossierProvider>
            </NhiemVuProvider>
          </FormProvider>
        </ProcessProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
)

