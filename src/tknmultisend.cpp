#include <tknmultisend.hpp>

#include "contract_actions.cpp"

#include "list_mgmt.cpp"

#include "sending.cpp"

void tknmultisend::maintenance_check() {
  eosio::check(!get_config().get().maintenance,
               "Contract is under maintenance");
}
