require 'rails_helper'

RSpec.describe FragmentsModel, type: :model do
  it 'can be instantiated' do
    model = FragmentsModel.new
    expect(model).to be_a(FragmentsModel)
  end

  it 'responds to fragments_present?' do
    model = FragmentsModel.new
    expect(model).to respond_to(:fragments_present?)
  end
end