class FragmentsModel < Bim::IfcModels::IfcModel
  # Store fragment files as attachments with description 'fragment'
  FRAGMENT_DESCRIPTION = 'fragment'
  IFC_DESCRIPTION = 'ifc'

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

  def ifc_attachments
    attachments.where(description: IFC_DESCRIPTION)
  end

  def add_ifc_attachment(file)
    filename = file.respond_to?(:original_filename) ? file.original_filename : File.basename(file.path)
    call = ::Attachments::CreateService
      .bypass_whitelist(user: User.current)
      .call(file: file, container: self, filename: filename, description: IFC_DESCRIPTION)

    call.on_failure { Rails.logger.error "Failed to add ifc attachment: #{call.message}" }
  end

  def delete_ifc_attachments
    ifc_attachments.each(&:destroy)
  end

  def ifc_present?
    ifc_attachments.exists?
  end
end

