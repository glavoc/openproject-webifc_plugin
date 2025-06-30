$:.push File.expand_path("../lib", __FILE__)
$:.push File.expand_path("../../lib", __dir__)

require "open_project/openproject_webifc_plugin/version"

Gem::Specification.new do |s|
  s.name        = "openproject-webifc_plugin"
  s.version     = OpenProject::OpenprojectWebifcPlugin::VERSION

  s.authors     = "OpenProject GmbH"
  s.email       = "info@openproject.org"
  s.homepage    = "https://community.openproject.org/projects/openproject-webifc-plugin"
  s.summary     = "OpenProject Openproject Webifc Plugin"
  s.description = "FIXME"
  s.license     = "FIXME"

  s.files = Dir["{app,config,db,lib}/**/*"] + %w(CHANGELOG.md README.md)
end
