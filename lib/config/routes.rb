OpenProject::Application.routes.draw do
  mount OpenProject::OpenprojectWebifcPlugin::Engine, at: '/webifc'
end
