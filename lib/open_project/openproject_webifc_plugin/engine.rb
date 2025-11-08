# Prevent load-order problems in case openproject-plugins is listed after a plugin in the Gemfile
# or not at all
require "open_project/plugins"

module OpenProject
  module OpenprojectWebifcPlugin
    class Engine < ::Rails::Engine
      engine_name :openproject_webifc_plugin

      include OpenProject::Plugins::ActsAsOpEngine

      register "openproject_webifc_plugin",
               :author_url => "https://openproject.org",
               :requires_openproject => ">= 12.0.0" do
        project_module :webifc_viewer do
          permission :view_webifc_viewer, 
                     { 'openproject_webifc_plugin/webifc_viewer': [:index, :list, :download] }
          permission :upload_ifc_files,
                     { 'openproject_webifc_plugin/webifc_viewer': [:upload] },
                     require: :member
        end
      end

      menu :project_menu,
           :webifc_viewer,
           { controller: '/openproject_webifc_plugin/webifc_viewer', action: 'index' },
           caption: 'Web IFC Viewer',
           after: :wiki,
           icon: 'icon-3d',
           if: ->(project) { project.module_enabled?(:webifc_viewer) }

    end
  end
end
