module Bim
  module IfcModels
    class FragmentsModel < IfcModel
      # Store fragment files as attachments with description 'fragment'
      FRAGMENT_DESCRIPTION = 'fragment'

      def fragment_attachments
        attachments.where(description: FRAGMENT_DESCRIPTION)
      end

      def add_fragment_attachment(file)
        filename = file.respond_to?(:original_filename) ? file.original_filename : File.basename(file.path)
        call = ::Attachments::CreateService
          .bypass_whitelist(user: User.current)
          .call(file: file, container: self, filename: filename, description: FRAGMENT_DESCRIPTION)

        call.on_failure { Rails.logger.error "Failed to add fragment attachment: #{call.message}" }
      end

      def delete_fragment_attachments
        fragment_attachments.each(&:destroy)
      end

      def fragments_present?
        fragment_attachments.exists?
      end
    end
  end
end
