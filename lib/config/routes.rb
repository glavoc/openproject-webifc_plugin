OpenProject::Application.routes.draw do
  scope 'projects/:project_id' do
    namespace :openproject_webifc_plugin do
      resources :webifc_viewer, only: [:index] do
        collection do
          post :upload
          get :list
        end
        member do
          get :download
        end
      end
    end
  end
  
  mount OpenProject::OpenprojectWebifcPlugin::Engine, at: '/webifc'
end
