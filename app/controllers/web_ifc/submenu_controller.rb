# frozen_string_literal: true

class WebIfc::SubmenuController < ApplicationController
  layout 'base'
  before_action :find_project
  
  def index
    # Placeholder for future logic
    render 'web_ifc/submenu/index'
  end

  private

  def find_project
    @project = Project.find(params[:project_id]) if params[:project_id]
  end
end
