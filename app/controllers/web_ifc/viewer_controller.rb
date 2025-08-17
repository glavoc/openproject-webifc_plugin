# frozen_string_literal: true

module WebIfc
  class ViewerController < ::ApplicationController
    before_action :find_project_by_project_id
    before_action :authorize
    before_action :find_all_ifc_models
    before_action :set_default_models
    before_action :parse_showing_models
    before_action :parse_bcf_props  # parse BCF props

    def show
      # Show all IFC models by default if none are selected
      @ifc_models = @project.ifc_models
      @shown_model_ids = @ifc_models.pluck(:id) if @shown_model_ids.empty?

      # Pass BCF props to frontend via gon
      gon.bcf_props = @bcf_props
      gon.models = @shown_model_ids
      gon.view_name = @bcf_view_name
    end

    private

    def find_all_ifc_models
      @ifc_models = @project
        .ifc_models
        .includes(:attachments)
        .order("created_at ASC")
    end

    def set_default_models
      @default_ifc_models = @ifc_models.where(is_default: true)
    end

    def parse_showing_models
      @shown_model_ids =
        if params[:models]
          JSON.parse(params[:models]) rescue []
        else
          []
        end

      @shown_ifc_models = @ifc_models.select { |model| @shown_model_ids.include?(model.id) }
    end

    def parse_bcf_props
      default_props = {
        "c" => ["id", "subject", "bcfThumbnail", "type", "status", "assignee", "updatedAt"],
        "t" => "id:desc"
      }

      @bcf_props = if params[:query_props].present?
                     JSON.parse(params[:query_props]) rescue default_props
                   else
                     default_props
                   end

      @bcf_view_name = params[:name] || "all_open"
    end
  end
end
