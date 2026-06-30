# Do not add internal artifact snapshots in v0.1

Flowspec v0.1 will not keep historical JSON or rendered artifact snapshots in the internal audit directory. The current audit artifacts plus `revision-log.md` are sufficient for the first upgraded version, and adding snapshot retention would introduce naming, cleanup, and diff policy before there is a clear need.
