# frozen_string_literal: true

require 'open_project/plugins'

module OpenProject::WEBiFCPlugin
  # The OpenProject::WEBiFCPlugin::Engine class is the main entry point for the plugin.
  # It registers the plugin with OpenProject and sets up the necessary configurations.
  class Engine < ::Rails::Engine
    engine_name :openproject_webifc_plugin

    include OpenProject::Plugins::ActsAsOpEngine

    register(
      'openproject-webifc_plugin',
      author_url: 'https://openproject.org',
      requires_openproject: '>= 13.1.0'
    ) do
      # We define a new project module here for our controller including a permission.
      # The permission is necessary for us to be able to add menu items to the project
      # menu. You will not need to add a permission for adding menu items to the `top_menu`
      # or `admin_menu`, however.
      #
      # You may have to enable the project module ("Kittens module") under project
      # settings before you can see the menu entry.
      project_module :web_ifc_viewer do
        permission :view_web_ifc,
                   {
                     'web_ifc/viewer': %i[index]
                   },
                   permissible_on: [:project]

        permission :manage_web_ifc, {
          web_ifc: %i[new create edit destroy]
        }, permissible_on: [:project]
      end

      menu :project_menu,
           :web_ifc,
           { controller: '/web_ifc/viewer', action: 'index' },
           after: :overview,
           param: :project_id,
           caption: 'Web IFC Viewer',
           icon: :squirrel,
           html: { id: 'web-ifc-menu-item' },
           if: ->(project) { true }

      menu :top_menu,
           :web_ifc,
           '/web_ifc/viewer',
           after: :projects,
           param: :project_id,
           caption: 'Web IFC Frontend'
    end

    config.to_prepare do
      OpenProject::Hook
    end

    config.after_initialize do
      OpenProject::Static::Homescreen.manage :blocks do |blocks|
        blocks.push(
          { partial: 'homescreen_block', if: proc { true } }
        )
      end
    end

    config.after_initialize do
      OpenProject::Notifications.subscribe 'user_invited' do |token|
        user = token.user

        Rails.logger.debug "#{user.mail} invited to OpenProject"
      end
    end
  end
end
