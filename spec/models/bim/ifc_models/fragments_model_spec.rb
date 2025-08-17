require 'rails_helper'

RSpec.describe Bim::IfcModels::FragmentsModel, type: :model do
  let(:project) { create(:project) }
  let(:user)    { create(:user) }

  it "can be created with valid attributes" do
    model = described_class.new(
      title: "Test IFC Model",
      project: project,
      uploader: user,
      conversion_status: :pending
    )

    expect(model.save).to be_truthy
    expect(model).to be_persisted
  end

  it "can be read after creation" do
    model = create(:ifc_model, project: project, uploader: user)
    found = described_class.find(model.id)

    expect(found).to eq(model)
    expect(found.title).to eq(model.title)
  end

  it "can be updated" do
    model = create(:ifc_model, title: "Old Title", project: project, uploader: user)
    model.update(title: "New Title")

    expect(model.reload.title).to eq("New Title")
  end

  it "can be destroyed" do
    model = create(:ifc_model, project: project, uploader: user)
    model_id = model.id
    model.destroy

    expect(described_class.exists?(model_id)).to be_falsey
  end

  it "is invalid without a title" do
    model = described_class.new(project: project, uploader: user)
    expect(model).not_to be_valid
    expect(model.errors[:title]).to include("can't be blank")
  end

  it "is invalid without a project" do
    model = described_class.new(title: "Test", uploader: user)
    expect(model).not_to be_valid
    expect(model.errors[:project]).to include("can't be blank")
  end
end
