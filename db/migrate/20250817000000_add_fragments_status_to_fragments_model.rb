#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) the OpenProject GmbH
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# See COPYRIGHT and LICENSE files for more details.
#++

class AddFragmentsStatusToFragmentsModel < ActiveRecord::Migration[6.1]
  def change
    add_column :ifc_models, :fragments_status, :integer, default: 0
    add_column :ifc_models, :fragments_error, :text
  end
end
