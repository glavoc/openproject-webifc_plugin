# lib/open_project/webifc_plugin/engine.rb
require 'open_project/plugins'

module OpenProject
  module WEBiFCPlugin
    class Engine < ::Rails::Engine
      engine_name :openproject_webifc_plugin

      include OpenProject::Plugins::ActsAsOpEngine

      register 'openproject-webifc_plugin',
               author: 'BuildBIM',
               homepage: 'https://buildbimopb.com',
               version: OpenProject::WEBiFCPlugin::VERSION do

        menu_item :web_ifc_viewer,
                  { controller: '/web_ifc/viewer', action: :index },
                  caption: 'IFC Viewer',
                  icon: 'icon2 icon-view',
                  only_if: -> { User.current.logged? },
                  html: { class: 'web-ifc-menu-item' }
      end

      initializer 'webifc_plugin.precompile_assets' do |app|
        app.config.assets.precompile += %w[
          openproject-webifc_plugin/*
        ]
      end
    end
  end
end
