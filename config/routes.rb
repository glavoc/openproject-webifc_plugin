Rails.application.routes.draw do
  scope '', as: 'webifc_plugin' do
    scope 'projects/:project_id', as: 'project' do
      get 'web_ifc/viewer', to: 'web_ifc/viewer#index', as: 'web_ifc_viewer'
    end
  end
end
