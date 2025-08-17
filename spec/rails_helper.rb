require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'

# Adjust the path to point to OpenProject app environment file
require_relative '../../openproject/config/environment'

abort("The Rails environment is running in production mode!") if Rails.env.production?

require 'rspec/rails'

begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  # You can add plugin-specific fixture paths if needed
  # config.fixture_path = File.expand_path('../fixtures', __FILE__)
  
  config.use_transactional_fixtures = true

  config.filter_rails_from_backtrace!
end
