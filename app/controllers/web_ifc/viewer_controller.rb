# frozen_string_literal: true

module WebIfc
  # Description/Explanation of the controller
  class ViewerController < ::ApplicationController
    # Check for the permissions of the user
    # as defined in the engine.rb permissions block
    before_action :find_project_by_project_id
    before_action :authorize

    def index; end
  end
end
