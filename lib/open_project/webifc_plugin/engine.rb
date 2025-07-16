# frozen_string_literal: true

require 'open_project/plugins'
require 'active_support/dependencies'

module OpenProject
  module WebIfcPlugin
    # This is the main engine for the OpenProject Web IFC Plugin.
    class Engine < ::Rails::Engine
      engine_name :openproject_webifc_plugin

      include OpenProject::Plugins::ActsAsOpEngine

      register(
        'openproject-webifc_plugin',
        author_url: 'https://openproject.org',
        requires_openproject: '>= 13.1.0'
      ) do
        project_module :web_ifc_viewer do
          permission  :view_web_ifc,
                      { 'web_ifc/viewer': %i[index] },
                      permissible_on: [:project]

          permission  :manage_web_ifc,
                      { web_ifc: %i[new create edit destroy] },
                      permissible_on: [:project]
        end

        menu  :top_menu,
              :web_ifc,
              '/web_ifc/viewer',
              after: :projects,
              param: :project_id,
              caption: 'Web IFC Frontend'

        Redmine::MenuManager.map(:project_menu) do |menu|
          # Top-level menu entry for "Web IFC"
          menu.push :web_ifc,
                    { controller: '/web_ifc/viewer', action: 'index' },
                    after: :work_packages,
                    param: :project_id,
                    caption: 'Web IFC Viewer',
                    icon: :squirrel,
                    html: { id: 'web-ifc-menu-item' },
                    if: ->(project) { true }

          # Submenu rendered when "Web IFC" is expanded
          menu.push :web_ifc_panels,
                    { controller: '/web_ifc/viewer', action: 'index' },
                    parent: :web_ifc,
                    partial: '/web_ifc/menu/menu'
        end
      end
      # config.to_prepare do
      #   ::OpenProject::WebIfcPlugin::Hooks
      # end
    end
  end
end
