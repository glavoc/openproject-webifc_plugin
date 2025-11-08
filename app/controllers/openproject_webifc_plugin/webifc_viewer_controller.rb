# frozen_string_literal: true

module OpenprojectWebifcPlugin
  class WebifcViewerController < ApplicationController
    before_action :find_project_by_project_id
    before_action :authorize

    menu_item :webifc_viewer

    def index
      @attachments = @project.attachments.where("filename LIKE ?", "%.ifc")
    end

    def upload
      file = params[:file]
      
      if file.present?
        attachment = Attachment.new(
          container: @project,
          file: file,
          author: User.current,
          filename: file.original_filename,
          content_type: file.content_type
        )

        if attachment.save
          render json: { 
            success: true, 
            attachment_id: attachment.id,
            filename: attachment.filename,
            url: download_path(attachment.id)
          }
        else
          render json: { 
            success: false, 
            errors: attachment.errors.full_messages 
          }, status: :unprocessable_entity
        end
      else
        render json: { 
          success: false, 
          errors: ['No file provided'] 
        }, status: :bad_request
      end
    end

    def download
      attachment = Attachment.find(params[:id])
      
      if attachment.container == @project || User.current.admin?
        send_file attachment.diskfile,
                  filename: attachment.filename,
                  type: attachment.content_type,
                  disposition: 'inline'
      else
        render_403
      end
    rescue ActiveRecord::RecordNotFound
      render_404
    end

    def list
      attachments = @project.attachments.where("filename LIKE ?", "%.ifc")
      
      render json: attachments.map { |a|
        {
          id: a.id,
          filename: a.filename,
          filesize: a.filesize,
          created_at: a.created_at,
          author: a.author&.name,
          url: download_path(a.id)
        }
      }
    end

    private

    def download_path(attachment_id)
      url_for(
        controller: '/openproject_webifc_plugin/webifc_viewer',
        action: 'download',
        id: attachment_id,
        project_id: @project.identifier
      )
    end
  end
end
