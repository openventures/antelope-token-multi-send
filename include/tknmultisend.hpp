#include <eosio/asset.hpp>
#include <eosio/eosio.hpp>
#include <eosio/singleton.hpp>
#include <eosio/system.hpp>

#include <eosio.token.hpp>

CONTRACT tknmultisend : public eosio::contract {
public:
  using eosio::contract::contract;

  struct cfg_params {};

  [[eosio::action]] void createlist(eosio::name author, std::string label,
                                    std::vector<eosio::name> recipients);
  [[eosio::action]] void rmlist(eosio::name author, uint64_t list_id);
  [[eosio::action]] void setlistlabel(eosio::name author, uint64_t list_id,
                                      std::string label);

  [[eosio::action]] void addtolist(eosio::name author, uint64_t list_id,
                                   std::vector<eosio::name> recipients);

  [[eosio::action]] void rmfromlist(eosio::name author, uint64_t list_id,
                                    std::vector<eosio::name> recipients);

  [[eosio::action]] void clearlist(eosio::name author, uint64_t list_id);

  [[eosio::on_notify("*::transfer")]] void on_deposit(
      eosio::name from, eosio::name to, eosio::asset quantity,
      std::string memo);

  [[eosio::action]] void init();
  [[eosio::action]] void destruct();
  [[eosio::action]] void maintenance(bool maintenance);
  [[eosio::action]] void setparams(cfg_params & params);

private:
  struct [[eosio::table("config")]] _config_entity {
    bool maintenance = true;
    cfg_params params;
  };
  typedef eosio::singleton<eosio::name("config"), _config_entity> _config;

  _config get_config() { return _config(get_self(), get_self().value); }

  struct [[eosio::table("lists")]] _list_entity {
    uint64_t list_id;
    std::string label;
    std::vector<eosio::name> recipients;
    auto primary_key() const { return list_id; }
  };
  typedef eosio::multi_index<eosio::name("lists"), _list_entity> _list;

  _list get_lists(eosio::name author) {
    return _list(get_self(), author.value);
  };

  void maintenance_check();
};