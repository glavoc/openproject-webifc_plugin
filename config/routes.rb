# description: Routes for the OpenProject WebIfc plugin

# frozen_string_literal: true

# This file is part of OpenProject.
# It is subject to the license terms in the LICENSE file found in the top-level directory of this distribution.
# No part of OpenProject, including this file, may be copied, modified, propagated, or distributed except according to
# the terms contained in the LICENSE file.

require 'open_project/webifc_plugin/engine'
OpenProject::WebifcPlugin::Engine.routes.draw do
  # Viewer route with optional project context
  get '/viewer', to: 'web_ifc/viewer#index', as: 'web_ifc_viewer'
end
