# Prevent load-order problems in case openproject-plugins is listed after a plugin in the Gemfile
# or not at all
require "open_project/plugins"

module OpenProject::Openproject-webifcPlugin
  class Engine < ::Rails::Engine
    engine_name :openproject-webifc_plugin

    include OpenProject::Plugins::ActsAsOpEngine

    register "openproject_webifc_plugin",
             :author_url => "https://openproject.org",
             :requires_openproject => ">= 12.0.0"
    menu :project_menu,
     :webifc_viewer,
     { controller: '/openproject_webifc_plugin/webifc_viewer', action: 'index' },
     caption: 'Web IFC Viewer',
     after: :wiki,
     icon: 'icon3d'

  end
end
