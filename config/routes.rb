Rails.application.routes.draw do
  scope '', as: 'webifc_plugin' do
    scope 'projects/:project_id', as: 'project' do
      # uncomment to reroute default bcf viewer to our plugin
      # get '/bcf', to: 'web_ifc/viewer#index', as: 'web_ifc_viewer'
      get 'web_ifc/viewer', to: 'web_ifc/viewer#index', as: 'web_ifc_viewer'
      get '/bcf_props', to: 'bcf_props#show'
    end
  end
end
