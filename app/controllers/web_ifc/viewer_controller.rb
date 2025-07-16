# frozen_string_literal: true

module WebIfc
  class ViewerController < ::ApplicationController
    before_action :find_project_by_project_id
    before_action :authorize
    before_action :find_all_ifc_models
    before_action :set_default_models
    before_action :parse_showing_models

    def show
      @ifc_models = @project.ifc_models
      @shown_model_ids = @ifc_models.pluck(:id) # Show all models by default
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
          JSON.parse(params[:models])
        else
          []
        end

      @shown_ifc_models = @ifc_models.select { |model| @shown_model_ids.include?(model.id) }
    end
  end
end
